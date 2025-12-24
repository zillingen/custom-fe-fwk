import cleanup from 'rollup-plugin-cleanup'
import filesize from 'rollup-plugin-filesize'
import typescript from '@rollup/plugin-typescript'

export default {
  input: 'src/index.ts',
  plugins: [
    typescript({ 
      declarationDir: 'dist/types', 
      declaration: true, 
      declarationMap: true 
    }),
    cleanup(), 
  ],
  output: [
    {
      file: 'dist/fe-fwk.js',
      format: 'esm',
      plugins: [filesize()],
    },
  ],
  watch: {
    // Specific watch options go here
    include: './src/**', // Only watch files in the src directory
    exclude: 'node_modules/**', // Do not watch files in node_modules
    clearScreen: false, // Prevent the terminal from clearing on rebuilds
    buildDelay: 300, // Delay the build for 300ms after a change is detected
    // ... other watch options
  }
}
