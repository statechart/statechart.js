<scxml initial="s0" version="1.0">
  <state id="s0" initial="s01">
    <onentry>
       <send event="timeout" delay="1s"/>
    </onentry>
    <transition event="timeout" target="fail"/>

    <state id="s01">
      <onentry>
        <raise event="event1"/>
        <assign location="foo.bar.baz" expr={ 2 }/>
      </onentry>

      <transition event="event1" target="s02">
        <raise event="event2"/>
      </transition>
      <transition event="*" target="fail"/>
    </state>

    <state id="s02">
      <transition event="error" target="s03"/>
      <transition event="*" target="fail"/>
    </state>

    <state id="s03">
      <transition event="event2" target="pass"/>
      <transition event="*" target="fail"/>
    </state>
  </state>

  <final id="pass"></final>
  <final id="fail"></final>
</scxml>
