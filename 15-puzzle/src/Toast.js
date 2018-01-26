import $ from "jquery";

class Toast {
	constructor() {
		const $list = $('<ul>', {'class': 'toast-list'});
		$('body').append($list);
		this.$list = $list;
	}

	toast(message, duration=1500) {
		const $messageItem = $('<li>');
		$messageItem.text(message);
		this.$list.append($messageItem);

		setTimeout(function () {
			$messageItem.addClass('show');
		}, 5);
		setTimeout(_.bind(function () {
			$messageItem.addClass('fade-out');
			setTimeout(_.bind(function () {
				$messageItem.remove();
			}, this), 250)
		}, this), duration);
	}
}

const instance = new Toast();

export default instance;
