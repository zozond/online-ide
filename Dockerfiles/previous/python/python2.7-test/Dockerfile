FROM zozond/base:latest

RUN /bin/bash -c "apt update; apt install -y python2.7; apt install python-pip -y "

WORKDIR /app
#Code-Server 다운로드
RUN wget https://github.com/cdr/code-server/releases/download/v3.3.1/code-server-3.3.1-linux-amd64.tar.gz
RUN tar -xzvf code-server-3.3.1-linux-amd64.tar.gz
RUN mv code-server-3.3.1-linux-amd64 code-server
WORKDIR /app/code-server

# git config test
RUN mkdir -p /root/projects
WORKDIR /root/projects
# RUN git init

# git config test
ENV GIT_USERNAME "admin"
ENV GIT_USERMAIL "admin@danawa.com"
ENV GIT_REPO ""
ENV GIT_CREDENTIALS ""

RUN mkdir -p /root/projects
WORKDIR /root/projects


# SSH settings
WORKDIR /root
RUN /bin/bash -c "mkdir -p .ssh"
WORKDIR /root/.ssh
ENV RSA "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDFCcIM8Q/MtxSAvNWdQMAmH5MGoGV5BZGMvakneC+gVbvQzGF8vWHYJ/qYlZMi3kiIw1KVCrnuujzA+A/V0IPWwaepdq8hv/fDolRqNf6mubMjoWxbJuxgjCXnAs9AyiMkPuGRjKB3L2HOqGYV4cax3PgCLi9I0XHCQhgP0fla10h6Z31b67oR4pLEG24azdk3bGPIMkuBvAqODZk8ntG078nOLcaHJO21mp2k91+pRNob/O4/PIAulE+otvE+YfMfNqWqM6aHcayrueCR9U+5hkgoNTjCKm35PdxkXtmy4uzc5tw7t08f/Ur6Dg2ZkQLSp2lsa40+9FvB1u0JleRxTKPIf87Iwr65sWbZzULC1FMERmtmlT+CGroICGQDN2bkZztLPRBTo3v7GaTkLDUeVd4+zKAf9U44eGhWtsBL7ulgrcsWY1p2o21vqgheO7ovgIsm3JdBjJVgvSKAHCu+naipTClCKcRTEx6H1UuCJYKi1bCz0lmXcGVwZz1rAjs= admin@DA-PC-0484"

# 10000번 포트 / 22번 포트 사용
EXPOSE 10000
EXPOSE 22

ENV FOLDER "projects"
#Code-Server 시작
RUN /bin/bash -c "/app/code-server/code-server --install-extension donjayamanne.python-extension-pack --force"
RUN /bin/bash -c "/app/code-server/code-server --install-extension donjayamanne.git-extension-pack --force"

# 시작
CMD /bin/bash -c "echo ${RSA} >> authorized_keys; \
                    service ssh start; \
		    git config --global credential.helper store; \
                    git config --global user.name ${GIT_USERNAME}; \
                    git config --global user.email ${GIT_USERMAIL}; \
                    mkdir -p /root/${FOLDER}; \
                    cd /root/${FOLDER}; \
		    git init; \
                    git clone ${GIT_REPO}; \
		    cd ~ ; echo ${GIT_CREDENTIALS} >> .git-credentials ; \
                    /app/code-server/code-server --extensions-dir /root/.vscode-oss/extensions --auth=none --bind-addr 0.0.0.0:10000;"
