BINDIR=bin
SYSJR=sysjr
SYSJC=sysjc

all: bin/Freq.class

bin/Freq.class: src/relay.sysj
	$(SYSJC) -d $(BINDIR) --silence $?

run:
	CLASSPATH=$(BINDIR) $(SYSJR) lcf/relay.xml

clean:
	rm -rf $(BINDIR)

