const tagsToReplace = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
};

const replaceTag = (tag) => tagsToReplace[tag] || tag;

exports.safe_tags_replace = (str) => str.replace(/[&<>]/g, replaceTag);