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


// Public routes (no auth required)
router.get('/', async () => {
    return { hello: 'world' }
})

router.group(() => {
    router.post('/register', [AuthController, 'register'])
    router.post('/login', [AuthController, 'login'])
}).prefix('/api/auth')