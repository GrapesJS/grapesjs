export default ({ el }) => ({
  props: {
    myLabel: 'Hello',
    value: '',
    changed: 0
  },

  render({ props, set }) {
    return el('div', { class: 'input-field' }, [
      el(
        'label',
        { class: 'my-label' },
        `My label: ${props.myLabel} Value: ${props.value} changed: ${props.changed} rnd: ${props.rnd}`
      ),
      el('input', {
        class: 'my-input',
        value: props.value,
        oninput: ev => {
          set({ value: ev.target.value });
          set({ rnd: Math.random() });
        },
        onchange: () => set({ changed: props.changed + 1 })
      })
    ]);
  }
});
