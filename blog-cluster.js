/**
 * Created by sky on 2017/11/1.
 */
// 主线程、工作线程都执行-start
var cluster = require('cluster');

function startWorker() {
    var worker = cluster.fork();
    console.log('CLUSTER: Worker %d started', worker.id);
}
// 主线程、工作线程都执行-end

if (cluster.isMaster) {
    // 主线程都执行-start
    require('os').cpus().forEach(function () {
        startWorker();
    });

    // log any workers that disconnect; if a worker disconnects, it
    // should then exit, so we'll wait for the exit event to spawn
    // a new worker to replace it
    cluster.on('disconnect', function (worker) {
        console.log('CLUSTER: Worker %d disconnected from the cluster.',
            worker.id);
    });

    // when a worker dies (exits), create a worker to replace it
    cluster.on('exit', function (worker, code, signal) {
        console.log('CLUSTER: Worker %d died with exit code %d (%s)',
            worker.id, code, signal);
        startWorker();
    });
    // 主线程都执行-end
} else {
    // 工作线程都执行-start
    // start our app on worker; see index.js
    require('./blog.js')();
    // 工作线程都执行-end
}