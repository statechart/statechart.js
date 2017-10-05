<scxml initial="s0" version="1.0">
  <state id="s0" initial="s01">
    <onentry>
       <send event="timeout" delay="1s"/>
    </onentry>
    <transition event="timeout" target="fail"/>
    <transition event="event1" target="fail"/>
    <transition event="event2" target="pass"/>

    <state id="s01">
      <onentry>
        <raise event="event1"/>
      </onentry>

      <transition event="event1" target="s02"/>
      <transition event="*" target="fail"/>
    </state>

    <state id="s02">
      <onentry>
        <raise event="event2"/>
      </onentry>
      <transition event="event1" target="fail"/>
      <transition event="event2" cond="false" target="fail"/>
    </state>
  </state>

  <final id="pass"></final>
  <final id="fail"></final>
</scxml>
