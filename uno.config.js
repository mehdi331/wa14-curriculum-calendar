import { defineConfig, presetWind4, transformerDirectives, transformerVariantGroup } from 'unocss';

// Design tokens for WA14. Visuals stay identical to the Tailwind v4 build;
// these tokens just give semantic names (bg-wa-container, text-wa-text, ...)
// plus shortcuts (btn-primary, field-input, wa-card, ...) for the refactor.
// presetWind4 matches the Tailwind v4 utilities this app already uses
// (shadow-xs, hover:bg-*, color-mix opacity like bg-wa-container/95).
export default defineConfig({
  presets: [
    presetWind4({ dark: 'media' }),
  ],
  transformers: [
    transformerVariantGroup(),
    transformerDirectives(),
  ],
  theme: {
    colors: {
      wa: {
        bg: '#252625',
        container: '#003223',
        container2: '#00402E',
        text: '#D5E0D5',
        muted: '#9DB09D',
        menu: '#005B3F',
        menutext: '#D5E0D5',
        button: '#D65641',
        buttonhover: '#C04B37',
        buttontext: '#D5E0D5',
        border: '#2A5C4B',
        borderdeep: '#1F4A3C',
        cardhover: '#387A64',
        inputborder: '#C9CDD2',
        linelight: '#EEF0F2',
        line2: '#DDE2E6',
        panellight: '#F7F8F9',
        ink: '#003223',
        success: '#2D7A4F',
        warn: '#D0A023',
        dangerline: '#E3B8B8',
        golddark: '#9A6A16',
        cream: '#FFF8E8',
        creamline: '#F0D9A0',
      },
      type: {
        culture: '#E8B23D',
        personal: '#9DB09D',
        support: '#5FA97E',
        academic: '#D97355',
        circle: '#8A78C2',
        teaching: '#3E8FA0',
        inequity: '#C79236',
        meal: '#2A5C4B',
        practice: '#D786A8',
        debrief: '#A6ABB2',
      },
    },
  },
  shortcuts: {
    btn: 'inline-flex items-center gap-1.5 text-[13px] font-semibold rounded-lg px-3 py-2 cursor-pointer border border-transparent transition-all duration-150 active:scale-[0.98]',
    'btn-primary': 'btn bg-wa-button text-white hover:bg-wa-buttonhover shadow-xs',
    'btn-secondary': 'btn bg-wa-container text-wa-text border-wa-border hover:bg-wa-container2 hover:text-white',
    'btn-ghost': 'btn bg-transparent text-wa-text hover:bg-wa-container2/60 hover:text-white',
    'field-input': 'w-full px-2.5 py-2 rounded-md border border-wa-inputborder text-[13px] bg-white text-wa-bg box-border',
    'field-select': 'px-2.5 py-1.5 rounded-lg border border-wa-border text-[13px] bg-white text-wa-bg shadow-xs',
    'wa-card': 'bg-wa-container border border-wa-border rounded-lg',
    'wa-chip': 'inline-flex items-center justify-center rounded-md font-bold',
    'wa-panel-title': 'text-[13px] font-bold text-wa-text',
    'wa-label': 'text-xs text-wa-text font-semibold mb-[5px]',
    'wa-table-wrap': 'wa14-table-scroll wa14-floating-scroll',
  },
  safelist: [
    // Fragments appended dynamically in App.jsx (btnGhost + ' ...', inputStyle + ' ...').
    'text-[11.5px]', 'px-2', 'py-1',
    'w-auto', 'flex-1', 'min-w-[130px]', 'min-w-[120px]',
    'flex-1', 'justify-center', 'resize-y',
    'shadow-xs',
  ],
});
