<scxml initial="s0" version="1.0">

  <state id="s0" initial="s01p">
    <onentry>
      <send event="timeout" delay="1s"/>
    </onentry>
    <transition event="timeout" target="fail"/>

    <parallel id="s01p">
      <transition event="event1" target="s02"/>

      <state id="s01p1" initial="s01p11">
        <state id="s01p11">
          <onexit>
            <raise event="event2"/>
          </onexit>
          <transition target="s01p12">
            <raise event="event3"/>
          </transition>
        </state>
        <state id="s01p12"/>
      </state>

      <state id="s01p2" initial="s01p21">
        <state id="s01p21">
          <onexit>
           <raise event="event1"/>
          </onexit>
          <transition target="s01p22">
            <raise event="event4"/>
          </transition>
        </state>
        <state id="s01p22"/>
     </state>
    </parallel>

    <state id="s02">
      <transition event="event2" target="s03"/>
      <transition event="*" target="fail"/>
    </state>

    <state id="s03">
      <transition event="event3" target="s04"/>
      <transition event="*" target="fail"/>
    </state>

    <state id="s04">
      <transition event="event4" target="pass"/>
      <transition event="*" target="fail"/>
    </state>

  </state>

  <final id="pass"></final>
  <final id="fail"></final>
</scxml>
