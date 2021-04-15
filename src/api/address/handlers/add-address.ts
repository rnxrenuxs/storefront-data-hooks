import { BigcommerceApiError } from "../../utils/errors"
// import { AddAddressHandlers } from "../add-address"
import getCustomerId from "../../operations/get-customer-id"
import type { AddAddressHandlers } from "../add-address"

const addAddress: AddAddressHandlers["addAddress"] = async ({
	req,
	res,
	body,
	config,
}) => {
	if (
		!body.first_name ||
		!body.last_name ||
		!body.address1 ||
		!body.city ||
		!body.state_or_province ||
		!body.postal_code ||
		!body.country_code
	) {
		return res.status(400).json({
			data: null,
			errors: [{ message: "Invalid request" }],
		})
	}

	try {
		const { cookies } = req
		const customerToken = cookies[config.customerCookie]

		const customerId =
			customerToken && (await getCustomerId({ customerToken, config }))

		if (!customerId) {
			// If the customerToken is invalid, then this request is too
			return res.status(404).json({
				data: null,
				errors: [{ message: "Orders not found" }],
			})
		}

		await config.storeApiFetch("/v3/customers/addresses", {
			method: "POST",
			body: JSON.stringify([{ ...body, customer_id: customerId }]),
		})
	} catch (error) {
		throw error
	}

	res.status(200).json({ data: null })
}

export default addAddress
