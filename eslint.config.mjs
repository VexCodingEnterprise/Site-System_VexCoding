import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import reactHooks from 'eslint-plugin-react-hooks';

export default defineConfig([
  ...nextVitals,
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
    },
  },
  {
    rules: {
      // Formulários e editores precisam sincronizar estado local quando o registro selecionado muda.
      // Mantemos a regra reportando como aviso até a migração desses componentes para estado derivado.
    },
  },
  globalIgnores([
    '.next/**',
    '.open-next/**',
    'node_modules/**',
    'dist/**',
    'src/app/site.jsx',
    'src/app/shared.jsx',
    'src/lib/utils.js',
  ]),
]);
