document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('notificationForm');

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        event.stopPropagation();

        const name = document.getElementById('name').value.trim();
        const body = document.getElementById('body').value.trim();
        const id = document.getElementById('id').value.trim();
        const lesson = (document.getElementById('lesson').value??'').trim();
        const type = document.getElementById('type').value.trim();
        const lang = document.getElementById('lang').value.trim();

        fetch(`${location.origin}/api/notify`, {
            method: 'POST',
            body: JSON.stringify({ name, body, type, id, lesson, lang }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then( res => {
                if(!res.ok) {
                    throw res.json();
                }
                alert('All notifications were send.');
            })
            .catch( async err => alert((await err).error));
    });
});