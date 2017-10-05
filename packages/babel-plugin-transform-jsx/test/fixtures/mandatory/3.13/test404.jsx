<scxml initial="s0" version="1.0">
  <state id="s0" initial="s01p">
    <parallel id="s01p">
      <onexit>
        <raise event="event3"/>
      </onexit>
      <transition target="s02">
        <raise event="event4"/>
      </transition>

      <state id="s01p1">
        <onexit>
          <raise event="event2"/>
        </onexit>
      </state>

      <state id="s01p2">
         <onexit>
          <raise event="event1"/>
        </onexit>
      </state>
    </parallel>

    <state id="s02">
      <transition event="event1" target="s03"/>
      <transition event="*" target="fail"/>
    </state>

    <state id="s03">
      <transition event="event2" target="s04"/>
      <transition event="*" target="fail"/>
    </state>

    <state id="s04">
      <transition event="event3" target="s05"/>
      <transition event="*" target="fail"/>
    </state>

    <state id="s05">
      <transition event="event4" target="pass"/>
      <transition event="*" target="fail"/>
    </state>
  </state>

  <final id="pass"></final>
  <final id="fail"></final>
</scxml>
