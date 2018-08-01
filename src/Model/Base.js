/* global use */
'use strict'

require('@adonisjs/fold')

const mongoose = use('Adonis/Addons/Mongoose')
const { Schema } = mongoose

class BaseModel {
  /**
   * Here is where you define hooks (middleware)
   *
   * @static
   * @memberof BaseModel
   */
  static boot ({ schema }) {

  }

  /**
   * You should replace this static property if you'd want to use
   * the buildModel functionality. Using this you can define your
   * schema inside your class definition.
   *
   * Read more: http://mongoosejs.com/docs/guide.html#definition
   *
   * @readonly
   * @static
   * @memberof BaseModel
   * @returns {Object}
   */
  static get schema () {
    throw new Error('You must override the static get schema() property')
  }

  /**
   * You should replace this static property id you'd want to use
   * custom schema options. This object is passed as a second parameter
   * when doing new Schema(schema, options).
   *
   * Read more: http://mongoosejs.com/docs/guide.html#options
   *
   * @readonly
   * @static
   * @memberof BaseModel
   */
  static get schemaOptions () {
    return {}
  }

  /**
   * Returns a created mongoose model, named like the name parameter.
   * It takes the
   *
   * @param {String} modelName
   * @returns {Mongoose Model}
   */
  static buildModel (modelName, conn = null) {
    const options = this.schemaOptions;

    if (!modelName) {
      throw new Error('You must specify a model name on Model.buildModel("modelName") ')
    }

    if (this.timestamps !== false) {
      options.timestamps = { createdAt: 'created_at', updatedAt: 'updated_at' }
    }

    this._schema = new Schema(this.schema, options);

    this.__createIndexes();

    this.boot({
      schema: this._schema,
    })

    if (conn) {
      try {
        return conn.model(modelName);
      } catch (error) {
        return conn.model(modelName, this._schema);
      }
    } else {
      try {
        return mongoose.model(modelName);
      } catch (error) {
        return mongoose.model(modelName, this._schema);
      }
    }
  }

  static index (...args) {
    // If the schema is yet not created
    if (!this._schema) {
      // Store indexes in temp array until the schema is created
      if (!this.__indexes) {
        this.__indexes = []
      }
      this.__indexes.push(args)
    } else {
      // Create the indexes right away
      this._schema.index(...args)
    }
  }

  static __createIndexes () {
    if (this.__indexes && this.__indexes.length) {
      this.__indexes.forEach((index) => this._schema.index(...index))
      this.__indexes = null
    }
  }

  /**
  * Class.primaryKey definition. You can customize it in case it's different in your model
  * This functionality is required for the Auth Schemas and Serializers
  *
  * Using id as default. ref: http://mongoosejs.com/docs/api.html#document_Document-id
  *
  * @readonly
  * @static
  * @memberof BaseModel
  * @returns {String}
  */
  static get primaryKey () {
    return 'id'
  }

  /**
   * Returns the primaryKey defined statically for the Model
   *
   * @readonly
   * @memberof BaseModel
   * @returns {String}
   */
  get primaryKey () {
    return this.constructor.primaryKey
  }

  /**
   * Returns the value for the primaryKey. Meaning it returns the
   * model's id. It can be an ObjectId, or whatever you want
   *
   * @readonly
   * @memberof BaseModel
   * @returns {Mixed}
   */
  get primaryKeyValue () {
    return this[this.primaryKey]
  }
}

module.exports = BaseModel
