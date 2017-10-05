<scxml version="1.0">
  <state id="s0">
    <onentry>
      <raise event="event1"/>
    </onentry>
    <onentry>
      <raise event="event2"/>
    </onentry>

    <transition event="event1" target="s1"/>
    <transition event="*" target="fail"/>
  </state>

  <state id="s1">
    <transition event="event2" target="pass"/>
    <transition event="*" target="fail"/>
  </state>

  <final id="pass"></final>
  <final id="fail"></final>
</scxml>
