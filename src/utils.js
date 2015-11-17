export function isString(obj) {
	return typeof obj === 'string'
}

export function autobind(target, key, descriptor) {
	const fn = descriptor.value

	delete descriptor.value
	delete descriptor.writable

	descriptor.get = function() {
		const bound = fn.bind(this)

		Object.defineProperty(this, key, {
			configurable: true,
			writable: true,
			value: bound
		})

		return bound
	}
}
