const { Toast } = require('bootstrap'),
    utility = require('./utility');

module.exports = {
    toast: (text, color) => {
        const toastTemplate = document.getElementById('toastTemplate');
        const node = toastTemplate.content.cloneNode(true).firstElementChild;
        if (color) {
            node.classList.remove('bg-primary');
            node.classList.add(color);
        }
        const toastBody = node.getElementsByClassName('d-flex')[0].getElementsByClassName('toast-body')[0];
        toastBody.innerHTML = utility.safe_tags_replace(text) + toastBody.innerHTML;
        document.getElementById('toast-container').appendChild(node);
        const toast = new Toast(node);
        node.addEventListener('hidden.bs.toast', () => node.remove());
        toast.show();
        return toast;
    },
    confirm: (text, callback) => {
        const toastTemplate = document.getElementById('confirmToastTemplate');
        const node = toastTemplate.content.cloneNode(true).firstElementChild;
        const toastBody = node.getElementsByClassName('toast-body')[0];
        toastBody.innerHTML = utility.safe_tags_replace(text) + toastBody.innerHTML;
        document.getElementById('toast-container').appendChild(node);
        const toast = new Toast(node);
        let callbackCalled = false;
        const cb = (val) => {
            if (callbackCalled) return;
            callbackCalled = true;
            return callback(null, val);
        }
        node.addEventListener('hidden.bs.toast', () => {
            cb(false);
            node.remove();
        });

        const div = toastBody.getElementsByTagName('div')[0];

        div.getElementsByTagName('button')[0].onclick = () => {
            cb(true);
            toast.hide();
        }
        toast.show();
        return toast;
    }
}