/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import router from '@adonisjs/core/services/router'
const AuthController = () => import('#controllers/auth_controller')
const CategoriesController  = () => import('#controllers/categories_controller')


// Public routes (no auth required)
router.get('/', async () => {
    return { hello: 'world' }
})

router.group(() => {
    router.post('/register', [AuthController, 'register'])
    router.post('/login', [AuthController, 'login'])
}).prefix('/api/auth')

router.group(() => {
    router.get('/', [CategoriesController, 'index'])
    router.get('/all', [CategoriesController, 'listAll'])
    router.get('/:id', [CategoriesController, 'show'])
    router.post('/', [CategoriesController, 'store'])
    router.put('/:id', [CategoriesController, 'update'])
    router.delete('/:id', [CategoriesController, 'destroy'])
 
}).prefix('/api/categories')