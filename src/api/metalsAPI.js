let fetched = false
//let numTimes = 0
//import fs from 'fs'
//import path from 'path'

const APIKEY = import.meta.env.METALDEV_API
if (!APIKEY) {
	throw new Error('METALDEV_API environment variable is not set!!! -nima')
}

export default async () => {
	if (fetched) {
		return
	}
	const url = new URL('https://api.metals.dev/v1/latest')
	url.search = new URLSearchParams({
		api_key: APIKEY.toString(),
		currency: 'USD',
		unit: 'toz',
	})

	const response = await fetch(url, {
		headers: {
			Accept: 'application/json',
		},
	})

	if (!response.ok) {
		console.error('To Nima: API request failed with status:', response.status)
		return
	}

	const result = await response.json()
	const path = Bun.file('src/lib/data/metals.json')
	Bun.write(path, JSON.stringify(result))

	//FOR TESTING
	/* 	const url = 'https://jsonplaceholder.typicode.com/todos'

	fetch(url)
		.then((response) => response.json())
		.then((data) => {
			const filePath = path.resolve('src/api/test.json')
			fs.writeFileSync(filePath, JSON.stringify(data))
		})
		.catch((error) => console.error('Error:', error))
    numTimes++
	console.log('fetched', numTimes)
 */
	fetched = true
}
