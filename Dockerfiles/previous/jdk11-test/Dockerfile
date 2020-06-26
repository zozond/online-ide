FROM zozond/base:latest

# OpenJDK 설치
RUN /bin/bash -c "apt install -y openjdk-11-jdk"


#Code-Server 다운로드
WORKDIR /app
RUN wget https://github.com/cdr/code-server/releases/download/v3.3.1/code-server-3.3.1-linux-amd64.tar.gz
RUN tar -xzvf code-server-3.3.1-linux-amd64.tar.gz
RUN mv code-server-3.3.1-linux-amd64 code-server

# git config test
ENV GIT_USERNAME "admin"
ENV GIT_USERMAIL "admin@danawa.com"
ENV GIT_REPO ""
ENV GIT_CREDENTIALS ""

# Code-Server Java Settings
RUN /bin/bash -c "mkdir -p /root/.local/share/code-server/User/globalStorage/redhat.java"
WORKDIR "/root/.local/share/code-server/User"
RUN /bin/bash -c "touch settings.json"
RUN /bin/bash -c "echo '{' >> settings.json"
RUN /bin/bash -c "echo '    \"java.home\": \"/usr/lib/jvm/java-11-openjdk-amd64\",' >> settings.json"
RUN /bin/bash -c "echo '    \"java.configuration.checkProjectSettingsExclusions\": false,' >> settings.json"
RUN /bin/bash -c "echo '    \"java.semanticHighlighting.enabled\": true' >> settings.json"
RUN /bin/bash -c "echo '}' >> settings.json"

# SSH settings
WORKDIR /root
RUN /bin/bash -c "mkdir -p .ssh"
WORKDIR /root/.ssh
ENV RSA "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDFCcIM8Q/MtxSAvNWdQMAmH5MGoGV5BZGMvakneC+gVbvQzGF8vWHYJ/qYlZMi3kiIw1KVCrnuujzA+A/V0IPWwaepdq8hv/fDolRqNf6mubMjoWxbJuxgjCXnAs9AyiMkPuGRjKB3L2HOqGYV4cax3PgCLi9I0XHCQhgP0fla10h6Z31b67oR4pLEG24azdk3bGPIMkuBvAqODZk8ntG078nOLcaHJO21mp2k91+pRNob/O4/PIAulE+otvE+YfMfNqWqM6aHcayrueCR9U+5hkgoNTjCKm35PdxkXtmy4uzc5tw7t08f/Ur6Dg2ZkQLSp2lsa40+9FvB1u0JleRxTKPIf87Iwr65sWbZzULC1FMERmtmlT+CGroICGQDN2bkZztLPRBTo3v7GaTkLDUeVd4+zKAf9U44eGhWtsBL7ulgrcsWY1p2o21vqgheO7ovgIsm3JdBjJVgvSKAHCu+naipTClCKcRTEx6H1UuCJYKi1bCz0lmXcGVwZz1rAjs= admin@DA-PC-0484"
ENV FOLDER "projects"

# 10000번 포트 / 22번 포트 사용
EXPOSE 10000
EXPOSE 22

# Code-Server 패키지 설치 
RUN /bin/bash -c "/app/code-server/code-server --install-extension vscjava.vscode-java-pack --force"
RUN /bin/bash -c "/app/code-server/code-server --install-extension pivotal.vscode-boot-dev-pack --force"
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
