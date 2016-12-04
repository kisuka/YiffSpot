var Users = module.exports = {
	online: 0,
	pending: [],
	clients: {},

	getOnline: function() {
		return Users.online;
	}
}