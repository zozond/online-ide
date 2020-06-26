FROM ubuntu:18.04
ENV SHELL=/bin/bash

ENV DEBIAN_FRONTEND=noninteractive

RUN /bin/bash -c "apt-get update -y; apt-get upgrade -y;"
RUN /bin/bash -c "apt-get install wget -y;"
RUN /bin/bash -c "apt-get install -y vim;"
RUN /bin/bash -c "apt-get install -y git-core;"
RUN /bin/bash -c "apt-get install openssh-server -y; apt-get install -y ssh; apt install net-tools -y;"

# Root 비밀번호 변경
RUN /bin/bash -c "echo root:qwe123!@# | chpasswd"