const axios = require('axios')

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000'

const predictSpoilageRisk = async (payload) => {
	const { data } = await axios.post(`${AI_SERVICE_URL}/predict`, payload, {
		timeout: 12000,
	})

	return data
}

const predictSpoilageBatch = async (rows) => {
	const { data } = await axios.post(
		`${AI_SERVICE_URL}/predict-batch`,
		{ rows },
		{
			timeout: 25000,
		},
	)

	return data
}

module.exports = {
	predictSpoilageRisk,
	predictSpoilageBatch,
	AI_SERVICE_URL,
}
