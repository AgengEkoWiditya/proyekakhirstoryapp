import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import RegisterPage from '../pages/register/register-page';
import LoginPage from '../pages/login/login-page';
import AddStoryPage from '../pages/add/add-story-page';
import FavoritesPage from '../pages/favorites/favorites-page'; // sudah object dengan render() dan afterRender()

const routes = {
  '/': new HomePage(),
  '/about': new AboutPage(),
  '/register': new RegisterPage(),
  '/login': new LoginPage(),
  '/add': new AddStoryPage(),
  '/favorites': FavoritesPage, // sudah object
};

export default routes;
