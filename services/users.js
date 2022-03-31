// User information

let users = [
  {
    id: '89454e76-20c7-4921-a8e9-9efcaedfe0ff',
    username: 'John Smith',
    number: '0851234567',
    amount: 2.45
  },
  {
    id: 'db651691-78a8-40b2-96ea-a49cd3826b84',
    username: 'David Bond',
    number: '0857654321',
    amount: 0.15
  },
];

module.exports = {
  getUser: (username, number) => users.filter(user => user.username == username && user.number == number),
  getAll: () => users
}