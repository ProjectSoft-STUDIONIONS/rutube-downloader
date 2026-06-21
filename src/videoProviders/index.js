console.log('load');
const videoProviders = [
	require("./aserPro"),
	require("./ok"),
	require("./rutube"),
	require("./vk"),
];

exports.selectVideoProvider = function (url) {
	for (let provider of videoProviders) {
		if (provider.mayUse(url)) return provider;
	}
	/**
	 * Правильный вывод ошибки на ненайденный загрузкик
	 */
	return {
		mayUse: false,
		loadVideo: function(cfg){
			throw new Error("Не найдено загрузчика для: " + cfg.url)
		}
	};
};
