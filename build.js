const fs = require('fs');
const { minify: minifyJS } = require('terser');
const { execSync } = require('child_process');

console.log('🚀 Building production bundle...\n');

// Read source files
const css = fs.readFileSync('widget.css', 'utf8');
const js = fs.readFileSync('widget.js', 'utf8');
const html = fs.readFileSync('widget.html', 'utf8');

// Minify CSS
console.log('📦 Minifying CSS...');
const minifiedCSS = execSync(`echo '${css.replace(/'/g, "\\'")}' | cleancss`, { encoding: 'utf8' });

// Minify JavaScript
console.log('📦 Minifying JavaScript...');
minifyJS(js, {
    compress: {
        dead_code: true,
        drop_console: false,
        drop_debugger: true,
        keep_classnames: false,
        keep_fnames: false,
    },
    mangle: true,
    format: {
        comments: false
    }
}).then(minifiedJSResult => {
    const minifiedJS = minifiedJSResult.code;

    // Create dist directory
    if (!fs.existsSync('dist')) {
        fs.mkdirSync('dist');
    }

    // Create single-file bundle
    const bundle = `
/* ChatPulse Widget - Production Bundle */
(function(){
    // Inject CSS
    const style = document.createElement('style');
    style.textContent = \`${minifiedCSS}\`;
    document.head.appendChild(style);

    // Inject HTML
    const widgetHTML = \`${html.match(/<body>([\s\S]*)<\/body>/)[1].replace(/`/g, '\\`')}\`;
    const container = document.createElement('div');
    container.innerHTML = widgetHTML;
    document.body.appendChild(container);

    // Execute JS
    ${minifiedJS}
})();
`;

    // Write bundle
    fs.writeFileSync('dist/widget.min.js', bundle);

    // Calculate sizes
    const originalSize = (css.length + js.length + html.length) / 1024;
    const bundleSize = Buffer.byteLength(bundle) / 1024;
    const gzipSize = execSync(`echo '${bundle.replace(/'/g, "\\'")}' | gzip -c | wc -c`, { encoding: 'utf8' });
    const gzipSizeKB = parseInt(gzipSize) / 1024;

    console.log('\n✅ Build complete!\n');
    console.log('📊 Bundle Statistics:');
    console.log(`   Original size: ${originalSize.toFixed(2)} KB`);
    console.log(`   Minified size: ${bundleSize.toFixed(2)} KB`);
    console.log(`   Gzipped size:  ${gzipSizeKB.toFixed(2)} KB`);
    console.log(`\n📁 Output: dist/widget.min.js`);

    if (gzipSizeKB > 25) {
        console.log('\n⚠️  Warning: Bundle size exceeds 25KB target');
    } else {
        console.log('\n🎉 Bundle size is within 25KB target!');
    }

}).catch(err => {
    console.error('❌ Build failed:', err);
    process.exit(1);
});
