#building and tagging images with unique tag here we used git commit sha   
docker build -t neerajchimbili/multi-react:latest -t neerajchimbili/multi-react:$GIT_SHA -f ./client/Dockerfile ./client
docker build -t neerajchimbili/multi-server:latest -t neerajchimbili/multi-server:$GIT_SHA -f ./server/Dockerfile ./server
docker build -t neerajchimbili/multi-worker:latest -t neerajchimbili/multi-worker:$GIT_SHA -f ./worker/Dockerfile ./worker

#pushing the images
docker push neerajchimbili/multi-react:latest 
docker push neerajchimbili/multi-server:latest
docker push neerajchimbili/multi-worker:latest

docker push neerajchimbili/multi-react:$GIT_SHA
docker push neerajchimbili/multi-server:$GIT_SHA
docker push neerajchimbili/multi-worker:$GIT_SHA

#applying configs on to k8s cluster
kubectl apply -f k8s

#imperative deployment with new images
kubectl set image deployments/client-deployment client=neerajchimbili/multi-react:$GIT_SHA
kubectl set image deployments/server-deployment server=neerajchimbili/multi-server:$GIT_SHA
kubectl set image deployments/worker-deployment worker=neerajchimbili/multi-worker:$GIT_SHA
