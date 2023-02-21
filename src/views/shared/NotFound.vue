<template>
  <b-container
    class="h-100 d-flex flex-column justify-content-center align-items-center mo-error"
  >
    <i class="fa fa-do-not-enter m-3" />
    <h3>Page not found!</h3>
    <p>
      Page <code>{{ $route.path }}</code> doesn't exist.
    </p>
    <a href="/">Go to home</a>
  </b-container>
</template>
