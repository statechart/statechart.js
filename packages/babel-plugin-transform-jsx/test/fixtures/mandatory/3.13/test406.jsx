<scxml version="1.0" initial="s0">

  <state id="s0" initial="s01">
    <onentry>
      <send event="timeout" delay="1s"/>
    </onentry>
    <transition event="timeout" target="fail"/>

    <state id="s01">
      <transition target="s0p2">
        <raise event="event1"/>
      </transition>
    </state>

    <parallel id="s0p2">
      <transition event="event1" target="s03"/>

      <state id="s01p21">
        <onentry>
          <raise event="event3"/>
        </onentry>
      </state>

      <state id="s01p22">
        <onentry>
          <raise event="event4"/>
        </onentry>
      </state>

      <onentry>
        <raise event="event2"/>
      </onentry>
    </parallel>

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
