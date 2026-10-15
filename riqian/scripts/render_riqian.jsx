#target photoshop
app.displayDialogs = DialogModes.NO;

/*
 * Usage from Photoshop's script runner:
 *   render_riqian.jsx /absolute/path/to/payload.json
 *
 * The payload must set approved=true. This script never touches the source PSD.
 */
(function () {
    var MAX_QUOTE = 54;
    var MAX_ATTRIBUTION = 28;
    var MAX_SOURCE = 38;

    function fail(message) { throw new Error("Riqian render blocked: " + message); }
    function readJson(file) {
        if (!file.exists) fail("payload does not exist: " + file.fsName);
        file.encoding = "UTF-8";
        if (!file.open("r")) fail("cannot open payload");
        var result = JSON.parse(file.read());
        file.close();
        return result;
    }
    function resolvePath(base, value) {
        var file = new File(value);
        if (file.exists || value.charAt(0) === "/") return file;
        return new File(base.fsName + "/" + value);
    }
    function resolveFolder(base, value) {
        var folder = new Folder(value);
        if (folder.exists || value.charAt(0) === "/") return folder;
        return new Folder(base.fsName + "/" + value);
    }
    function findLayer(container, name, matches) {
        var i, layer;
        for (i = 0; i < container.layers.length; i++) {
            layer = container.layers[i];
            if (layer.name === name) matches.push(layer);
            if (layer.typename === "LayerSet") findLayer(layer, name, matches);
        }
    }
    function oneLayer(doc, name) {
        var matches = [];
        findLayer(doc, name, matches);
        if (matches.length !== 1) fail("expected exactly one layer named '" + name + "', found " + matches.length);
        return matches[0];
    }
    function textLayer(doc, name) {
        var layer = oneLayer(doc, name);
        if (layer.kind !== LayerKind.TEXT) fail("'" + name + "' must be a native text layer");
        return layer;
    }
    function setText(doc, name, value, maxLength) {
        if (typeof value !== "string" || !value.length) fail("missing text for '" + name + "'");
        if (value.length > maxLength) fail("'" + name + "' exceeds " + maxLength + " characters");
        textLayer(doc, name).textItem.contents = value;
    }
    function replaceArtwork(doc, artworkPath) {
        if (!artworkPath) return;
        var target = oneLayer(doc, "riqian.artwork");
        var art = new File(artworkPath);
        if (!art.exists) fail("artwork does not exist: " + art.fsName);
        doc.activeLayer = target;
        var action = charIDToTypeID("Plc ");
        var desc = new ActionDescriptor();
        desc.putPath(charIDToTypeID("null"), art);
        desc.putEnumerated(charIDToTypeID("FTcs"), charIDToTypeID("QCSt"), charIDToTypeID("Qcsa"));
        executeAction(action, desc, DialogModes.NO);
        doc.activeLayer.name = "riqian.artwork";
        target.remove();
    }
    function saveManifest(output, payload, psdFile, pngFile) {
        var manifest = {
            candidate_id: payload.candidate_id,
            approved: true,
            generated_at: new Date().toUTCString(),
            psd: psdFile.fsName,
            png: pngFile.fsName,
            sources: payload.sources,
            asset_license: payload.asset_license
        };
        var file = new File(output.fsName + "/" + psdFile.name.replace(/\.psd$/i, ".manifest.json"));
        file.encoding = "UTF-8";
        if (!file.open("w")) fail("cannot write manifest");
        file.write(JSON.stringify(manifest, null, 2));
        file.close();
    }

    var payloadFile;
    if ($.arguments && $.arguments.length === 1) {
        payloadFile = new File($.arguments[0]);
    } else {
        payloadFile = File.openDialog("选择已获批准的 riqian payload.json", "*.json");
        if (!payloadFile) fail("no payload selected");
    }
    var payload = readJson(payloadFile);
    if (payload.approved !== true) fail("employee approval is required");
    if (!payload.sources || payload.sources.length < 2) fail("two independent sources are required");
    if (!payload.asset_license || !payload.asset_license.status) fail("asset licence record is required");

    var template = resolvePath(payloadFile.parent, payload.template_path);
    if (!template.exists) fail("template does not exist: " + template.fsName);
    var output = resolveFolder(payloadFile.parent, payload.output_dir);
    if (!output.exists && !output.create()) fail("cannot create output directory");
    var doc = app.open(template);
    try {
        setText(doc, "riqian.date.month", payload.text.month, 3);
        setText(doc, "riqian.date.day", payload.text.day, 2);
        setText(doc, "riqian.date.separator", payload.text.separator, 1);
        setText(doc, "riqian.quote", payload.text.quote, MAX_QUOTE);
        setText(doc, "riqian.attribution", payload.text.attribution, MAX_ATTRIBUTION);
        setText(doc, "riqian.source", payload.text.source, MAX_SOURCE);
        oneLayer(doc, "riqian.artwork");
        replaceArtwork(doc, payload.artwork_path);

        var stem = payload.date + "-riqian";
        var psdFile = new File(output.fsName + "/" + stem + ".psd");
        var pngFile = new File(output.fsName + "/" + stem + ".png");
        var psdOptions = new PhotoshopSaveOptions();
        psdOptions.layers = true;
        psdOptions.embedColorProfile = true;
        doc.saveAs(psdFile, psdOptions, true, Extension.LOWERCASE);
        doc.convertProfile("sRGB IEC61966-2.1", Intent.RELATIVECOLORIMETRIC, true, true);
        var pngOptions = new ExportOptionsSaveForWeb();
        pngOptions.format = SaveDocumentType.PNG;
        pngOptions.PNG8 = false;
        pngOptions.transparency = false;
        pngOptions.includeProfile = true;
        doc.exportDocument(pngFile, ExportType.SAVEFORWEB, pngOptions);
        saveManifest(output, payload, psdFile, pngFile);
    } finally {
        doc.close(SaveOptions.DONOTSAVECHANGES);
    }
}());
