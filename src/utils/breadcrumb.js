import user from "../router/user.js";
import admin from "@/router/admin";
import manufacturer from "../router/manufacturer";

const routes = buildRoutes([...user, ...admin, ...manufacturer]);

function formatPath(p) {
  return p[p.length - 1] === "/" ? p : `${p}/`;
}

function formatRouteName(url, name) {
  if (!name) {
    throw new Error(`Route "${url}" has no name!`);
  }
  return url.indexOf("new") > 0 ? name.replace("Edit", "Add") : name;
}

function buildRoutes(routes) {
  return routes
    .map(r =>
      r.children
        ? r.children.map(c => ({
            path: `${r.path}/${formatPath(c.path)}`,
            route: c
          }))
        : {
            path: formatPath(r.path),
            route: r
          }
    )
    .flat();
}

export function parsePath(path) {
  const parts = path.split("/").filter(e => e !== "");
  return parts
    .map((part, i) => {
      const url = formatPath(`/${parts.slice(0, i + 1).join("/")}`);
      const [match] = findRouteMatches(routes, url);
      // edit route name ("Add ..." instead of "Edit ...")
      // if the route is for creation of new entity
      return match
        ? {
            ...match.route,
            name: formatRouteName(url, match.route.name),
            url
          }
        : null;
    })
    .filter(e => !!e);
}

function findRouteMatches(routes, testUrl) {
  return routes.filter(r => {
    const pattern = formatPath(
      // replace all occurrences of :objectId alike strings with a regex pattern
      // that matches number of any length or "new" string
      // TODO: replace /[0-9]+/ with uuid matching regex if uuid's are implemented
      r.path.replaceAll(/\/:(([a-z]|[A-Z])*)(\/)*/g, "/([0-9]+|new)/")
    ).replaceAll("/", "\\/");
    return new RegExp(`^${pattern}$`).test(formatPath(testUrl));
  });
}

export function isEditScreen(route) {
  if (!route.name) {
    throw new Error(`Route "${route.path}" name is not defined!`);
  }
  return route.name.startsWith("Edit");
}

export default parsePath;
