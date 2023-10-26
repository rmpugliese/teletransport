const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)

module.exports.robotSchema = Joi.object({
    robot: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        location: Joi.string().required().escapeHTML(),
        connecturl: Joi.string().uri().required().escapeHTML(),
        connectremoteurl: Joi.string().uri().required().escapeHTML(),
        model: Joi.string().required().valid(...['jobot','viqi','unknown']),
        serial: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML(),
        allowedusers: Joi.alternatives().try(Joi.string().regex(/([^,]+)/).escapeHTML(),Joi.allow(null))
    }).required(),
    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
});

module.exports.missionSchema = Joi.object({
    mission: Joi.object({
      name: Joi.string().required().escapeHTML(),
      tasks: Joi.string().required().escapeHTML(),
    }).required()
});

module.exports.eventSchema = Joi.object({
    event: Joi.object({
      robot: Joi.string().required(),
      user: Joi.string().required(),
      mission: Joi.string().required(),
      goal: Joi.string().required(),
      action: Joi.string().required(),
      parameters: Joi.string().required(),
      distance: Joi.number().required(),
      result: Joi.number().required(),
      start: Joi.date().timestamp().required(),
      end: Joi.date().timestamp().required(),
    }).required()
});

module.exports.scheduleSchema = Joi.object({
    schedule: Joi.object({
      robot: Joi.string().required(),
      user: Joi.string().required(),
      mission: Joi.string().required(),
      parameters: Joi.string().required(),
      at: Joi.date().timestamp().required(),
      repeat: Joi.number().required(),
    }).required()
});

module.exports.telepresenceSchema = Joi.object({
    telepresence: Joi.object({
      robot: Joi.string().required(),
      user: Joi.string().required(),
      who: Joi.string().required(),
      email: Joi.string().required(),
      whom: Joi.string().required(),
      where: Joi.string().required(),
      when: Joi.date().timestamp().required(),
      duration: Joi.number().required(),
      zoom: Joi.string().required().escapeHTML(),
      start: Joi.string().required().escapeHTML(),
      join: Joi.string().required().escapeHTML(),
    }).required()
});
