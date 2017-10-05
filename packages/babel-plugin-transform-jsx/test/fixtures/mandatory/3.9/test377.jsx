<scxml version="1.0">
  <state id="s0">
    <onexit>
      <raise event="event1"/>
    </onexit>
    <onexit>
      <raise event="event2"/>
    </onexit>
    <transition target="s1"/>
  </state>

  <state id="s1">
    <transition event="event1" target="s2"/>
    <transition event="*" target="fail"/>
  </state>

  <state id="s2">
    <transition event="event2" target="pass"/>
    <transition event="*" target="fail"/>
  </state>

  <final id="pass"></final>
  <final id="fail"></final>
</scxml>
