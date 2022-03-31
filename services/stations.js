// vending machine logins

let machines = [
  {
    id: 'b8cd3d55-c3bc-4f19-b3f9-3d3f92d192d4',
    password: '$2a$12$LQf4l7AItghSghQjZVK6DOuZoW0nFcmYhHLS2gNxz45At4str6KIi' // station1
  }
];

module.exports = {
  getMachine: (id) => machines.find(i => i.id == id)
}
