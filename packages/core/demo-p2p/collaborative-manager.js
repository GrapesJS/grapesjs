// collaborative-manager.js

class CollaborativeManager {
  constructor(editor, options = {}) {
    this.editor = editor;
    this.options = {
      signalingUrl: 'ws://localhost:3001',
      roomId: 'demo-room',
      clientId: this._generateClientId(),
      enable: true,
      ...options,
    };

    if (!this.options.enable) return;

    this.ws = null;
    this.peers = new Map(); // peerId -> { pc, dc }
    this.patchSeq = 0;
    this.seenPatches = new Set(); // for loop protection
    this.isApplyingRemote = false;

    this._connectSignaling();
    this._bindEditorEvents();
  }

  _generateClientId() {
    return 'c_' + Math.random().toString(36).slice(2);
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

  _createPeerConnection(peerId, isInitiator) {
    if (this.peers.has(peerId)) return this.peers.get(peerId);

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    let dc;

    if (isInitiator) {
      dc = pc.createDataChannel('patches');
      this._setupDataChannel(peerId, dc);
      this._createOffer(peerId, pc);
    } else {
      // dataChannel будет создан на ondatachannel
      pc.ondatachannel = (event) => {
        dc = event.channel;
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

    const peer = { pc, dc: null };
    this.peers.set(peerId, peer);
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
    console.log('[Collab] DataChannel opened with peer', peerId);
    this.peers.get(peerId).dc = dc;

    dc.onopen = () => {
      console.log('[Collab] DC open:', peerId);
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
    if (msg.type === 'patch') {
      const { clientId, patchSeq, patches } = msg;

      // Loop protection: пропускаем свои и уже обработанные
      const key = `${clientId}:${patchSeq}`;
      if (clientId === this.options.clientId) return;
      if (this.seenPatches.has(key)) return;
      this.seenPatches.add(key);

      // Применяем патч локально
      this.applyRemotePatch(patches, { from: clientId, patchSeq });

      // И (опционально) ретранслируем дальше другим пирами
      this._rebroadcastPatchFromPeer(peerId, msg);
    }
  }

  _rebroadcastPatchFromPeer(sourcePeerId, msg) {
    // Патч уже имеет clientId/patchSeq, так что другие клиенты
    // отфильтруют дубликаты по seenPatches.
    for (const [peerId, peer] of this.peers.entries()) {
      if (peerId === sourcePeerId) continue;
      if (peer.dc && peer.dc.readyState === 'open') {
        peer.dc.send(JSON.stringify(msg));
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

    // Здесь предполагаем, что PatchManager триггерит patch:update с {patches}
    editor.on('patch:update', ({ patches }) => {
      if (this.isApplyingRemote) return; // не пересылать то, что сами же получили
      this._broadcastPatch(patches);
    });

    // По желанию можно прокидывать undo/redo как патчи:
    editor.on('patch:undo', ({ patch }) => {
      if (this.isApplyingRemote) return;
      this._broadcastPatch(patch);
    });

    editor.on('patch:redo', ({ patch }) => {
      if (this.isApplyingRemote) return;
      this._broadcastPatch(patch);
    });
  }

  _broadcastPatch(patches) {
    this.patchSeq += 1;
    const message = {
      type: 'patch',
      clientId: this.options.clientId,
      patchSeq: this.patchSeq,
      patches,
    };

    for (const [, peer] of this.peers.entries()) {
      if (peer.dc && peer.dc.readyState === 'open') {
        peer.dc.send(JSON.stringify(message));
      }
    }
  }

  // === ВАЖНО: адаптируй к своему PatchManager API ===
  applyRemotePatch(patches, meta = {}) {
    this.isApplyingRemote = true;
    try {
      const pm = this.editor.PatchManager || this.editor.PatchModule || this.editor.Patch;
      if (pm && typeof pm.applyPatches === 'function') {
        pm.applyPatches(patches, { remote: true, ...meta });
      } else if (pm && typeof pm.applyPatch === 'function') {
        pm.applyPatch(patches, { remote: true, ...meta });
      } else {
        // fallback: если у тебя есть кастомный API, просто вызови его
        console.warn('[Collab] No PatchManager.apply* found, implement here');
      }
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
