const {sass} = require('laravel-mix');
const mix = require('laravel-mix');

mix.disableNotifications()

sass('app/assets/sass/styles.scss', 'app/assets/css/styles.css')


