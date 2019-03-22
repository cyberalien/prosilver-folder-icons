/**
 * Set forum icons
 */
(function() {
    var data = {/*replace*/},
        oldIconExists = Iconify.iconExists,
        generated = {};

    /**
     * Mix layers
     *
     * @param {Array} layers
     * @return {{body: string, width: number, height: number}}
     */
    function mix(layers) {
        var defs = '',
            body = '';

        layers.forEach(function(item) {
            var row = false,
                i;

            for (i = 0; i < item.icon.length; i++) {
                if (data[item.icon[i]] !== void 0) {
                    row = data[item.icon[i]];
                    break;
                }
            }

            if (row === false || row === null) {
                // Skip layer
                return;
            }

            // Add body
            body += '<g class="layer-' + item.layer + '">' + (typeof row === 'string' ? row : row.body) + '</g>';

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

        return mix([{
            layer: 'background',
            icon: ['forum-background']
        }, {
            layer: 'content',
            icon: [forumType, 'forum']
        }]);
    }

    function generateTopicIcon(type, parts) {
        var topicType = 'topic',
            read = true,
            locked = false,
            mine = false,
            layers;

        parts.forEach(function(part) {
            switch (part) {
                // Icon types
                case 'announcement':
                case 'sticky':
                case 'pm':
                case 'global':
                    topicType = part;
                    break;

                // Status
                case 'unread':
                    read = false;
                    break;

                case 'mine':
                    mine = true;
                    break;

                case 'locked':
                    locked = true;
            }
        });

        layers = [{
            layer: 'background',
            icon: [topicType + '-background', 'topic-background', 'forum-background']
        }, {
            layer: 'content',
            icon: [topicType, 'topic']
        }];

        if (locked) {
            layers.push({
                layer: 'locked',
                icon: [topicType + '-locked', 'topic-locked']
            });
        }

        if (mine) {
            layers.push({
                layer: 'mine',
                icon: [topicType + '-mine', 'topic-mine']
            });
        }

        return mix(layers);
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

    Iconify.iconExists = function(icon, prefix) {
        if (prefix !== 'phpbb-forum') {
            return oldIconExists(icon, prefix);
        }
        if (generated[icon]) {
            return true;
        }
        generated[icon] = true;
        Iconify.addIcon(prefix + ':' + icon, generateIcon(icon));

        return oldIconExists(icon, prefix);
    };
})();