const router = require('./src/routes/pharmacies');
console.log(JSON.stringify(router.stack.map((layer) => ({
  name: layer.name,
  route: layer.route && {
    path: layer.route.path,
    methods: layer.route.methods,
  },
  regexp: layer.regexp && layer.regexp.toString(),
})), null, 2));
