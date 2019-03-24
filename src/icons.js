/**
 * Set forum icons
 */
(function() {
    var data = {/*replace*/},
        oldIconExists = Iconify.iconExists,
        generated = {},
        topicMods = ['unread', 'hot', 'moved', 'mine', 'locked'];

    /**
     * Mix layers
     *
     * @param {Array} types
     * @param {Array} layers
     * @return {{body: string, width: number, height: number}}
     */
    function mix(types, layers) {
        var defs = '',
            body = '';

        layers.forEach(function(layer) {
            var row = false,
                key, i, j;

            for (i = 0; i < types.length; i++) {
                key = types[i] + '-' + layer;
                // Check for flag-specific layer: topic-content-locked
                for (j = 0; j < layers.length; j++) {
                    if (data[key + '-' + layers[j]] !== void 0) {
                        row = data[key + '-' + layers[j]];
                        break;
                    }
                }

                // Check for default layer: topic-content
                if (row === false && data[key] !== void 0) {
                    row = data[key];
                    break;
                }
            }

            if (row === false || row === null) {
                // Skip layer
                return;
            }

            // Add body
            body += '<g class="layer-' + layer + '">' + (typeof row === 'string' ? row : row.body) + '</g>';

            // Add defs
            if (typeof row === 'object' && row.defs !== void 0) {
                defs += row.defs;
            }
        });

        return {
            body: (defs === '' ? '' : '<defs>' + defs + '</defs>') + body,
            width: 32,
            height: 32
        };
    }

    /**
     * Generate icon for forum
     *
     * @param {string} type
     * @param {Array} parts
     * @return {{body: string, width: number, height: number}}
     */
    function generateForumIcon(type, parts) {
        var forumType = 'forum',
            read = true;

        parts.forEach(function(part) {
            switch (part) {
                // Content types
                case 'subforum':
                    forumType = 'forum-subforum';
                    break;

                case 'link':
                    forumType = 'forum-link';
                    break;

                case 'locked':
                    forumType = 'forum-locked';
                    break;

                // Status
                case 'unread':
                    read = false;
            }
        });

        return mix([forumType, 'forum'], ['background', 'content', 'overlay']);
    }

    function generateTopicIcon(topicType, parts) {
        var types = [],
            mods = {},
            layers = ['background', 'content', 'overlay'];

        parts.forEach(function(part) {
            if (topicMods.indexOf(part) !== -1) {
                mods[part] = true;
            }
        });

        types.push(topicType);
        if (topicType === 'global') {
            types.push('announce');
        }
        if (topicType !== 'topic') {
            types.push('topic');
        }
        types.push('forum');

        layers = layers.concat(Object.keys(mods));

        return mix(types, layers);
    }

    function generateIcon(name) {
        var parts = name.split('_'),
            type = parts.shift();

        if (type === 'forum') {
            return generateForumIcon(type, parts);
        } else {
            return generateTopicIcon(type, parts);
        }
    }

    // Layers to skip: edit this list

    Iconify.iconExists = function(icon, prefix) {
        if (prefix !== 'phpbb-forum') {
            return oldIconExists(icon, prefix);
        }
        if (generated[icon]) {
            return true;
        }
        generated[icon] = true;
        Iconify.addIcon(prefix + ':' + icon, generateIcon(icon), true);

        return oldIconExists(icon, prefix);
    };
})();