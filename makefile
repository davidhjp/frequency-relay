BINDIR=bin
SYSJR=sysjr
SYSJC=sysjc
URL=https://github.com/hjparker/systemj-release/releases/download/v2.1-123/sjdk-v2.1-123-g6017468.tgz
SYSJR=systemj/bin/sysjr
SYSJC=systemj/bin/sysjc

all: systemj/bin bin/Freq.class 

bin/Freq.class: src/relay.sysj
	$(SYSJC) -d $(BINDIR) --silence $?

systemj/bin:
	wget $(URL) -P systemj
	cd systemj; tar xvaf sjdk*.tgz ; mv sjdk*/* . ; chmod u+x bin/*

run:
	CLASSPATH=$(BINDIR) $(SYSJR) lcf/relay.xml

clean:
	rm -rf $(BINDIR)
	rm -rf systemj

