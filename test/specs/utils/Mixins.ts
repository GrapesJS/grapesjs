import { buildBase64UrlFromSvg } from 'utils/mixins';

describe('.buildBase64UrlFromSvg', () => {
  it('returns original when a none svg is provided', () => {
    const input = 'something else';
    expect(buildBase64UrlFromSvg(input)).toEqual(input)
  })

  it('returns base64 image when an svg is provided', () => {
    const input = `<svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>`;

    const output = 'data:image/svg+xml;base64,PHN2ZwogICAgICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgICAgIHdpZHRoPSIyNCIKICAgICAgaGVpZ2h0PSIyNCIKICAgICAgdmlld0JveD0iMCAwIDI0IDI0IgogICAgICBmaWxsPSJub25lIgogICAgICBzdHJva2U9ImN1cnJlbnRDb2xvciIKICAgICAgc3Ryb2tlLXdpZHRoPSIyIgogICAgICBzdHJva2UtbGluZWNhcD0icm91bmQiCiAgICAgIHN0cm9rZS1saW5lam9pbj0icm91bmQiCiAgICA+CiAgICAgIDxwb2x5Z29uIHBvaW50cz0iMSA2IDEgMjIgOCAxOCAxNiAyMiAyMyAxOCAyMyAyIDE2IDYgOCAyIDEgNiIgLz4KICAgICAgPGxpbmUgeDE9IjgiIHkxPSIyIiB4Mj0iOCIgeTI9IjE4IiAvPgogICAgICA8bGluZSB4MT0iMTYiIHkxPSI2IiB4Mj0iMTYiIHkyPSIyMiIgLz4KICAgIDwvc3ZnPg=='
    expect(buildBase64UrlFromSvg(input)).toEqual(output)
  })
});
