FROM centos:7.6.1810

#환경 변수 설정
ENV USER="danawa"
ENV HOSTNAME="docker_mobileweb"
ENV DEV_ADOPTED_ENV="DEVELOPING_SERVER"
ENV LANG="ko_KR.eucKR"
ENV HOME="/home/danawa"
ENV TZ=Asia/Seoul
ENV SHELL=/bin/bash

RUN /bin/bash -c "echo root:qwe123!@# | chpasswd"

#기본 설치
RUN yum -y upgrade
RUN yum -y install wget
RUN yum -y install gcc-c++
RUN yum -y install zlib-devel
RUN yum -y install openssl-devel
RUN yum -y install pcre-devel
RUN yum -y install expat-devel
RUN yum -y install httpd-devel
RUN yum -y install make
RUN yum -y install net-tools
RUN yum -y install curl
RUN yum -y install sudo
RUN yum -y install git
RUN yum -y install openssh
RUN yum -y install openssh-server
RUN yum -y install openssh-clients
RUN yum -y install maven

#OPENJDK8 설치
RUN yum install -y java-1.8.0-openjdk-devel.x86_64

ENV JAVA_HOME=/usr/lib/jvm/java-1.8.0-openjdk-1.8.0.252.b09-2.el7_8.x86_64
ENV CLASSPATH=${JAVA_HOME}/lib/tools.jar
ENV PATH=$PATH:${JAVA_HOME}/bin
RUN LANG='ko_KR.eucKR'

#유저 생성 및 패스워드 추가 
RUN useradd -ms /bin/bash danawa
RUN usermod -aG wheel danawa
RUN yum install -y sudo 
RUN echo 'danawa' | passwd danawa --stdin
RUN echo 'danawa ALL=NOPASSWD: ALL' >> /etc/sudoers
USER danawa

#Code-Server 다운로드
RUN mkdir -p /home/danawa/.cloud-ide
WORKDIR /home/danawa/.cloud-ide
RUN wget https://github.com/cdr/code-server/releases/download/3.4.1/code-server-3.4.1-linux-x86_64.tar.gz
RUN tar -xzvf code-server-3.4.1-linux-x86_64.tar.gz
RUN mv code-server-3.4.1-linux-x86_64 code-server

# GIT 환경변수 
ENV GIT_USERNAME "danawa"
ENV GIT_USERMAIL "danawa@danawa.com"
ENV GIT_REPO ""
ENV GIT_CREDENTIALS ""

#GIT 셋팅
RUN git config --global credential.helper store

# Code-Server Java Settings
RUN /bin/bash -c "mkdir -p /home/danawa/.local/share/code-server/User/globalStorage/redhat.java"
WORKDIR "/home/danawa/.local/share/code-server/User"
RUN /bin/bash -c "touch settings.json"
RUN /bin/bash -c "echo '{' >> settings.json"
RUN /bin/bash -c "echo '    \"java.home\": \"/usr/lib/jvm/java-1.8.0-openjdk-1.8.0.252.b09-2.el7_8.x86_64\",' >> settings.json"
RUN /bin/bash -c "echo '    \"java.configuration.checkProjectSettingsExclusions\": false,' >> settings.json"
RUN /bin/bash -c "echo '    \"java.semanticHighlighting.enabled\": true' >> settings.json"
RUN /bin/bash -c "echo '}' >> settings.json"

# SSH settings
RUN sudo ssh-keygen -q -t dsa -f /etc/ssh/ssh_host_dsa_key -N "" 
RUN sudo ssh-keygen -q -t rsa -f /etc/ssh/ssh_host_rsa_key -N "" 
RUN sudo ssh-keygen -q -t ecdsa -f /etc/ssh/ssh_host_ecdsa_key -N "" 
RUN sudo ssh-keygen -q -t ed25519 -f /etc/ssh/ssh_host_ed25519_key -N ""

RUN /bin/bash -c "mkdir -p /home/danawa/.ssh"
WORKDIR /home/danawa/.ssh
ENV RSA "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDFCcIM8Q/MtxSAvNWdQMAmH5MGoGV5BZGMvakneC+gVbvQzGF8vWHYJ/qYlZMi3kiIw1KVCrnuujzA+A/V0IPWwaepdq8hv/fDolRqNf6mubMjoWxbJuxgjCXnAs9AyiMkPuGRjKB3L2HOqGYV4cax3PgCLi9I0XHCQhgP0fla10h6Z31b67oR4pLEG24azdk3bGPIMkuBvAqODZk8ntG078nOLcaHJO21mp2k91+pRNob/O4/PIAulE+otvE+YfMfNqWqM6aHcayrueCR9U+5hkgoNTjCKm35PdxkXtmy4uzc5tw7t08f/Ur6Dg2ZkQLSp2lsa40+9FvB1u0JleRxTKPIf87Iwr65sWbZzULC1FMERmtmlT+CGroICGQDN2bkZztLPRBTo3v7GaTkLDUeVd4+zKAf9U44eGhWtsBL7ulgrcsWY1p2o21vqgheO7ovgIsm3JdBjJVgvSKAHCu+naipTClCKcRTEx6H1UuCJYKi1bCz0lmXcGVwZz1rAjs= admin@DA-PC-0484"
ENV FOLDER "project"

# 10000번 포트 / 22번 포트 사용
#PORT 설정
EXPOSE 80
EXPOSE 8080
EXPOSE 26379
EXPOSE 6381
EXPOSE 6100
EXPOSE 10000
EXPOSE 22

# Code-Server 패키지 설치 
RUN /bin/bash -c "/home/danawa/.cloud-ide/code-server/bin/code-server --install-extension vscjava.vscode-java-pack --force"
RUN /bin/bash -c "/home/danawa/.cloud-ide/code-server/bin/code-server --install-extension pivotal.vscode-boot-dev-pack --force"
RUN /bin/bash -c "/home/danawa/.cloud-ide/code-server/bin/code-server --install-extension donjayamanne.git-extension-pack --force"

# template 생성 
COPY /maven-example.tar /home/danawa/.template/
WORKDIR /home/danawa/.template
RUN sudo chown danawa /home/danawa/.template
RUN sudo chgrp danawa /home/danawa/.template
RUN tar -xvf maven-example.tar
RUN rm maven-example.tar
RUN mvn install
RUN mkdir -p /home/danawa/project

WORKDIR /home/danawa/.ssh

# 시작 (추후 쉘 스크립트로 바꾸면 좋을 듯)
CMD /bin/bash -c "echo ${RSA} >> authorized_keys; \
                    sudo /usr/sbin/sshd -D & \
                    git config --global user.name ${GIT_USERNAME}; \
                    git config --global user.email ${GIT_USERMAIL}; \
                    cd /home/danawa ; git clone ${GIT_REPO} ${FOLDER}; \
                    mv /home/danawa/.template /home/danawa/${FOLDER} ; rm -rf /home/danawa/${FOLDER}/.template ;\
		            cd ~ ; echo ${GIT_CREDENTIALS} >> .git-credentials ; \
                    /home/danawa/.cloud-ide/code-server/bin/code-server --extensions-dir /home/danawa/.local/share/code-server/extensions --auth=none --bind-addr 0.0.0.0:10000;"
