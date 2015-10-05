export const TEXT_NODE = 3;
const COMMENT_NODE = 8;

export function getNodeType(node) {
	if (node.nodeType === TEXT_NODE) {
		return 'text'
	}
	else if (node.nodeType === COMMENT_NODE) {
		return 'comment'
	}
	else if (node.tagName) {
		return node.tagName.toLowerCase()
	}
	else {
		throw new Error('Unknown Node Type')
	}
}

export function mapChildNodes(node, cb, state) {
	Array.prototype.slice.call(node.childNodes).map(node => {
		return cb(node, state)
	})
}