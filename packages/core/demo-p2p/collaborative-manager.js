// collaborative-manager.js

class CollaborativeManager {
  constructor(editor, options = {}) {
    this.editor = editor;
    this.options = {
      signalingUrl: 'ws://localhost:3001',
      roomId: 'demo-room',
      clientId: this._generateClientId(),
      enable: true,
      debug: false,
      ...options,
    };

    if (!this.options.enable) return;

    this.debug = !!this.options.debug;
    this.ws = null;
    this.peers = new Map(); // peerId -> { pc, dc }
    this.patchSeq = 0;
    this.seenPatches = new Set(); // for loop protection
    this.isApplyingRemote = false;

    this.isSynced = false;
    this.pendingPatches = []; // queued patches while waiting for init-state

    this._connectSignaling();
    this._bindEditorEvents();
  }

  _generateClientId() {
    return 'c_' + Math.random().toString(36).slice(2);
  }

  _isLeader(peerId) {
    return this.options.clientId < peerId;
  }

  _log(...args) {
    if (this.debug) {
      console.log(...args);
    }
  }

  _connectSignaling() {
    const { signalingUrl, roomId, clientId } = this.options;
    const url = `${signalingUrl}?roomId=${encodeURIComponent(roomId)}&clientId=${encodeURIComponent(clientId)}`;
    const ws = new WebSocket(url);

    this.ws = ws;

    ws.onopen = () => {
      console.log('[Collab] Signaling connected as', clientId);
    };

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      const { type, from } = data;

      if (from === this.options.clientId) return; // ignore self

      switch (type) {
        case 'connected':
          // server's hello, содержит clientId (наш)
          break;

        case 'peer-join':
          // Новый peer в комнате: мы инициатор, создаем offer
          this._createPeerConnection(from, true);
          break;

        case 'peer-leave':
          this._closePeer(from);
          break;

        case 'offer':
          await this._onOffer(from, data);
          break;

        case 'answer':
          await this._onAnswer(from, data);
          break;

        case 'candidate':
          await this._onCandidate(from, data);
          break;

        default:
          break;
      }
    };

    ws.onclose = () => {
      console.log('[Collab] Signaling closed, try reconnect later if needed');
      // Можно добавить автоматический reconnect при желании
    };
  }

  _sendSignal(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  _sendData(dc, message) {
    if (dc && dc.readyState === 'open') {
      try {
        dc.send(JSON.stringify(message));
      } catch (err) {
        console.warn('[Collab] Failed to send datachannel message', err);
      }
    }
  }

  _createPeerConnection(peerId, isInitiator) {
    console.log('[Collab] createPeerConnection to', peerId, 'initiator:', isInitiator);

    if (this.peers.has(peerId)) return this.peers.get(peerId);

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    // СНАЧАЛА создаём и сохраняем peer
    const peer = { pc, dc: null };
    this.peers.set(peerId, peer);

    if (isInitiator) {
      // инициатор сам создаёт DataChannel
      const dc = pc.createDataChannel('patches');
      peer.dc = dc;
      this._setupDataChannel(peerId, dc);
      this._createOffer(peerId, pc);
    } else {
      // принимающая сторона ждёт ondatachannel
      pc.ondatachannel = (event) => {
        const dc = event.channel;
        peer.dc = dc;
        this._setupDataChannel(peerId, dc);
      };
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this._sendSignal({
          type: 'candidate',
          candidate: event.candidate,
          to: peerId,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('[Collab] Peer', peerId, 'state:', pc.connectionState);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        this._closePeer(peerId);
      }
    };

    return peer;
  }

  async _createOffer(peerId, pc) {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    this._sendSignal({
      type: 'offer',
      to: peerId,
      sdp: offer,
    });
  }

  async _onOffer(peerId, data) {
    const peer = this._createPeerConnection(peerId, false);
    const { pc } = peer;

    await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    this._sendSignal({
      type: 'answer',
      to: peerId,
      sdp: answer,
    });
  }

  async _onAnswer(peerId, data) {
    const peer = this.peers.get(peerId);
    if (!peer) return;
    const { pc } = peer;
    await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
  }

  async _onCandidate(peerId, data) {
    const peer = this.peers.get(peerId);
    if (!peer) return;
    if (!data.candidate) return;

    try {
      await peer.pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    } catch (err) {
      console.error('[Collab] Error adding candidate', err);
    }
  }

  _setupDataChannel(peerId, dc) {
    console.log('[Collab] DataChannel created for peer', peerId);

    dc.onopen = () => {
      console.log('[Collab] DC open:', peerId);

      // Очень простой выбор "лидера": клиент с минимальным clientId
      const isLeader = this._isLeader(peerId); // строковое сравнение достаточно для демки

      if (isLeader) {
        const project = this.editor.getProjectData();
        const msg = {
          type: 'init-state',
          project,
        };
        this._log('[Collab] send init-state to', peerId);
        this._sendData(dc, msg);
        this._markSynced('leader');
      } else {
        this._log('[Collab] waiting for init-state from leader', peerId);
      }
    };

    dc.onclose = () => {
      console.log('[Collab] DC close:', peerId);
    };

    dc.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        this._onDataChannelMessage(peerId, msg);
      } catch (e) {
        console.error('[Collab] Invalid DC message', e);
      }
    };
  }

  _onDataChannelMessage(peerId, msg) {
    if (msg.type === 'init-state') {
      console.log('[Collab] received init-state from', peerId, msg);

      // Полная синхронизация проекта
      this.editor.loadProjectData(msg.project, { clear: true });
      this._markSynced('init-state');
      return;
    }

    if (msg.type === 'patch') {
      const { clientId, patchSeq, patches } = msg;

      console.log('[Collab] got patch from peer', peerId, 'client', clientId, 'seq', patchSeq, patches);

      const key = `${clientId}:${patchSeq}`;
      if (clientId === this.options.clientId) return;
      if (this.seenPatches.has(key)) return;
      this.seenPatches.add(key);

      const meta = { from: clientId, patchSeq };

      if (!this.isSynced) {
        console.log('[Collab] not synced yet, queue patch', meta);
        this.pendingPatches.push({ patch: patches, meta, sourcePeerId: peerId, raw: msg });
        return;
      }

      // patches здесь == один PatchProps
      this.applyRemotePatch(patches, meta);
      this._rebroadcastPatchFromPeer(peerId, msg);
    }
  }

  _markSynced(reason) {
    if (this.isSynced) return;
    this.isSynced = true;
    this._log('[Collab] synced', reason, 'pending', this.pendingPatches.length);
    this._flushPendingPatches();
  }

  _flushPendingPatches() {
    if (!this.isSynced || !this.pendingPatches.length) return;
    const queued = this.pendingPatches.slice();
    this.pendingPatches = [];

    queued.forEach((item) => {
      this.applyRemotePatch(item.patch, item.meta);
      if (item.raw) {
        this._rebroadcastPatchFromPeer(item.sourcePeerId, item.raw);
      }
    });
  }

  _rebroadcastPatchFromPeer(sourcePeerId, msg) {
    // Патч уже имеет clientId/patchSeq, так что другие клиенты
    // отфильтруют дубликаты по seenPatches.
    for (const [peerId, peer] of this.peers.entries()) {
      if (peerId === sourcePeerId) continue;
      if (peer.dc && peer.dc.readyState === 'open') {
        this._sendData(peer.dc, msg);
      }
    }
  }

  _closePeer(peerId) {
    const peer = this.peers.get(peerId);
    if (!peer) return;
    if (peer.dc) {
      try {
        peer.dc.close();
      } catch {}
    }
    if (peer.pc) {
      try {
        peer.pc.close();
      } catch {}
    }
    this.peers.delete(peerId);
    console.log('[Collab] Peer closed', peerId);
  }

  _bindEditorEvents() {
    const { editor } = this;

    const getPatch = (ev) => ev && (ev.patch || ev.patches || ev);

    editor.on('patch:update', (ev) => {
      const patch = getPatch(ev);
      console.log('[Collab] local patch:update', patch);

      if (!patch) return;
      if (this.isApplyingRemote) return;

      this._broadcastPatch(patch);
    });

    editor.on('patch:undo', (ev) => {
      const patch = getPatch(ev);
      console.log('[Collab] local patch:undo', patch);

      if (!patch) return;
      if (this.isApplyingRemote) return;

      this._broadcastPatch(patch);
    });

    editor.on('patch:redo', (ev) => {
      const patch = getPatch(ev);
      console.log('[Collab] local patch:redo', patch);

      if (!patch) return;
      if (this.isApplyingRemote) return;

      this._broadcastPatch(patch);
    });
  }

  _broadcastPatch(patch) {
    this.patchSeq += 1;
    const message = {
      type: 'patch',
      clientId: this.options.clientId,
      patchSeq: this.patchSeq,
      patches: patch, // поле можно оставить "patches" для совместимости, но внутри это PatchProps
    };

    console.log('[Collab] broadcast patch', message);

    for (const [peerId, peer] of this.peers.entries()) {
      console.log('[Collab]   peer', peerId, 'dc state:', peer.dc && peer.dc.readyState);
      if (peer.dc && peer.dc.readyState === 'open') {
        this._sendData(peer.dc, message);
      }
    }
  }

  // === ВАЖНО: адаптируй к своему PatchManager API ===
  // Применение удалённого патча через ваш PatchManager
  applyRemotePatch(patch, meta = {}) {
    console.log('[Collab] applyRemotePatch', patch, meta);

    this.isApplyingRemote = true;
    try {
      const editor = this.editor;
      const pm = editor.Patches || (editor.get && editor.get('Patches'));

      if (!pm || typeof pm.apply !== 'function') {
        console.warn('[Collab] PatchManager not found or has no .apply()', pm);
        return;
      }

      // patch здесь — это PatchProps, ровно тот формат, который генерит ваш PatchManager
      pm.apply(patch);
    } finally {
      this.isApplyingRemote = false;
    }
  }
}

// Чтобы можно было использовать как "плагин" GrapesJS
function CollaborativePlugin(editor, opts = {}) {
  const cfg = {
    collaboration: {
      enable: false,
      signalingUrl: 'ws://localhost:3001',
      roomId: 'demo-room',
      clientId: null,
      ...opts.collaboration,
    },
    ...opts,
  };

  if (!cfg.collaboration.enable) return;

  const clientId = cfg.collaboration.clientId || 'c_' + Math.random().toString(36).slice(2);
  editor.CollaborativeManager = new CollaborativeManager(editor, {
    signalingUrl: cfg.collaboration.signalingUrl,
    roomId: cfg.collaboration.roomId,
    clientId,
    enable: true,
  });
}

window.CollaborativeManager = CollaborativeManager;
window.CollaborativePlugin = CollaborativePlugin;
