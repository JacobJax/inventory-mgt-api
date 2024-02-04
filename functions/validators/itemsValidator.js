/* eslint-disable linebreak-style */
const Joi = require("joi");

// validate item to add
const addItemValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string()
        .required()
        .max(255),
    shop_price: Joi.number()
        .required(),
    quantity: Joi.number()
        .required(),
    storage_shelf_column_number: Joi.number()
        .required(),
    shop_billing_type: Joi.string()
        .required(),
    created_by: Joi.string()
        .required(),
    slug: Joi.string()
        .required(),
    storage_shelf_row_number: Joi.number()
        .required(),
    shop_receipt_number: Joi.string()
        .required(),
    storage_quantification_type: Joi.string()
        .required(),
  });

  // return Joi.validate(data, schema)
  return schema.validate(data);
};

// validate item to update
const updateItemValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string()
        .required()
        .max(255),
    shop_price: Joi.number()
        .required(),
    quantity: Joi.number()
        .required(),
    storage_shelf_column_number: Joi.number()
        .required(),
    shop_billing_type: Joi.string()
        .required(),
    slug: Joi.string()
        .required(),
    storage_shelf_row_number: Joi.number()
        .required(),
    storage_quantification_type: Joi.string()
        .required(),
  });

  // return Joi.validate(data, schema)
  return schema.validate(data);
};

module.exports.addItemValidation = addItemValidation;
module.exports.updateItemValidation = updateItemValidation;
