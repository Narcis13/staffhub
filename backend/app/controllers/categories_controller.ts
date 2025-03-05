import { inject } from '@adonisjs/core'
import Category from '#models/category'
import { HttpContext } from '@adonisjs/core/http'

@inject()
export default class CategoriesController {
  /**
   * Get all categories
   */
  async index({ response }: HttpContext) {
    const categories = await Category.query().where('is_active', true)
    return response.ok(categories)
  }

  /**
   * Get all categories including inactive ones (for admin use)
   */
  async listAll({ response }: HttpContext) {
    const categories = await Category.all()
    return response.ok(categories)
  }

  /**
   * Get a specific category by ID
   */
  async show({ params, response }: HttpContext) {
    const category = await Category.find(params.id)
    
    if (!category) {
      return response.notFound({ message: 'Category not found' })
    }

    return response.ok(category)
  }

  /**
   * Create a new category
   */
  async store({ request, response }: HttpContext) {
    const data = request.only(['name'])
    
    try {
      const category = await Category.create(data)
      return response.created(category)
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return response.conflict({ message: 'A category with this name already exists' })
      }
      return response.badRequest({ message: 'Could not create category', error: error.message })
    }
  }

  /**
   * Update a category
   */
  async update({ params, request, response }: HttpContext) {
    const category = await Category.find(params.id)
    
    if (!category) {
      return response.notFound({ message: 'Category not found' })
    }

    const data = request.only(['name', 'is_active'])
    
    try {
      category.merge(data)
      await category.save()
      return response.ok(category)
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return response.conflict({ message: 'A category with this name already exists' })
      }
      return response.badRequest({ message: 'Could not update category', error: error.message })
    }
  }

  /**
   * Soft delete a category by setting is_active to false
   */
  async destroy({ params, response }: HttpContext) {
    const category = await Category.find(params.id)
    
    if (!category) {
      return response.notFound({ message: 'Category not found' })
    }
    
    category.isActive = false
    await category.save()
    
    return response.ok({ message: 'Category deactivated successfully' })
  }
}