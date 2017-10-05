<scxml initial="s0" version="1.0">
  <datamodel>
    <data id="Var1" expr={ 0 }/>
  </datamodel>

  <state id="s0" initial="p0">
    <onentry>
      <raise event="event1"/>
      <send event="timeout" delay="1s"/>
    </onentry>
    <transition event="event2" target="fail"/>
    <transition event="timeout" target="fail"/>

    <parallel id="p0">

      <state id="p0s1">
        <transition event="event1"/>
        <transition event="event2"/>
      </state>

      <state id="p0s2">
        <transition event="event1" target="p0s1">
          <raise event="event2"/>
        </transition>
      </state>

      <state id="p0s3">
        <transition event="event1" target="fail"/>
        <transition event="event2" target="s1"/>
      </state>

      <state id="p0s4">
        <transition event="*">
          <assign location="Var1" expr={ ({ Var1 }) => Var1 + 1 }/>
        </transition>
      </state>
    </parallel>
  </state>

  <state id="s1">
    <transition cond={ ({ Var1 }) => Var1 == 2 } target="pass"/>
    <transition target="fail"/>
  </state>

  <final id="pass"></final>
  <final id="fail"></final>
</scxml>
