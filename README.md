# monitor-web

## Project setup
1. [Setup ssh keys for GitLab](https://docs.gitlab.com/ee/ssh/)
2. Clone git repository
   ```bash
   git clone git@gitlab.com:507-it-department/monitorv2/frontend.git
   ```
3. Configure FontAwesome
    ```bash
    npm config set "@fortawesome:registry" https://npm.fontawesome.com/
    npm config set "//npm.fontawesome.com/:_authToken" 421DED1D-5AD4-4896-B196-7DA569EB2C47
    ```
4. Install project dependencies
    ```bash
    npm i
    ```
5. Run app in development mode
    ```bash
    npm run serve
    ```

## Code structure

```bash
src
├── api # rest api endpoints definitions
├── assets # static assets
│   ├── images
│   └── scss
├── components # ui elements that are not whole screens (rendered by router)
│   ├── pure # components that do not contain any business logic (only render ui, given props)
│   └── statefull # components that contain business logic (api calls,...)
├── layouts
├── mixins # shared vue.js "component code"
├── router # router endpoint definitions + authentication validation
├── store # vuex store definitions
├── utils
└── views # screens that are rendered by router (displayed full page)
    ├── admin # screens for admin dashboard
    ├── manufacturer # screens for manufacturer dashboard
    ├── shared # shared screens (used in admin/manufacturer/user)
    └── user # screens for user dashboard
```

## Documentation

- [`MoTable`](src/components/pure/table/README.md)
- [`MoScreenWrapperModal`](src/components/pure/modals/screen-wrapper/README.md)
