
// Helper function to customize SVG with user data
function customizeSvg(svgTemplate: string, userData: URLSearchParams | object): string {
    console.log("customizeingSvg", userData)
    let customizedSvg = svgTemplate;

    // Replace each placeholder with user data
    if (userData instanceof URLSearchParams) {
        console.log("2");
        userData.forEach((value, key) => {
            const placeholder = `{{${key}}}`; // Assuming your SVG uses {{PLACEHOLDER}} syntax
            customizedSvg = customizedSvg.replace(new RegExp(placeholder, 'g'), value);
        });
    } else {
        console.log("1");
        
        for (const [key, value] of Object.entries(userData)) {
            
            const placeholder = `{{${key}}}`; // Assuming your SVG uses {{PLACEHOLDER}} syntax
            customizedSvg = customizedSvg.replace(new RegExp(placeholder, 'g'), value as string);
            console.log("work done");
            
        }

    }

    return customizedSvg;
}


export { customizeSvg }