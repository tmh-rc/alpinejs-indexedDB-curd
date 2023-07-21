function todo() {
    return {
        task: null,
        tasks: [],
        database: null,

        async init() {
            if (!("indexedDB" in window)) {
                alert("This browser doesn't support IndexedDB");
                return;
            }

            this.database = await this.openDatabase();
            this.tasks = await this.getTasks();
        },

        async openDatabase() {
            return new Promise((resolve, reject) => {
                let db = window.indexedDB.open("todo");

                db.onerror = (e) => {
                    reject("Error opening the database.");
                };

                db.onsuccess = (e) => {
                    resolve(e.target.result);
                };

                db.onupgradeneeded = (e) => {
                    e.target.result.createObjectStore("tasks", { keyPath: "id" });
                };
            });
        },

        async getTasks() {
            return new Promise((resolve, reject) => {
                this.database.transaction("tasks").objectStore("tasks").getAll().onsuccess = (e) => {
                    resolve(e.target.result);
                };
            });
        },

        async addTask() {
            return new Promise((resolve, reject) => {
                if (!this.task.trim()) {
                    alert("Task is required.");
                    return;
                }

                let id = new Date().getTime();
                let task = { id: id, name: this.task };
                this.tasks.push(task);
                this.task = "";

                this.database.transaction("tasks", "readwrite").objectStore("tasks").add(task).oncomplete =
                    (e) => {
                        resolve();
                    };
            });
        },

        editTask(task) {
            task.editing = true;
        },

        cancelEditTask(task) {
            delete task.editing;
        },

        async updateTask(task) {
            return new Promise((resolve, reject) => {
                delete task.editing;
                this.database.transaction("tasks", "readwrite").objectStore("tasks").put({
                    id: task.id,
                    name: task.name,
                }).onsuccess = (e) => {
                    resolve();
                };
            });
        },

        async removeTask(id) {
            return new Promise((resolve, reject) => {
                this.tasks = this.tasks.filter((task) => task.id != id);

                this.database.transaction("tasks", "readwrite").objectStore("tasks").delete(id).oncomplete =
                    (e) => {
                        resolve();
                    };
            });
        },
    };
}