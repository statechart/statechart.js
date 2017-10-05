<scxml version="1.0" initial="s0">

  <state id="s0">
    <datamodel>
      <data id="Var1" expr={ 0 }/>
    </datamodel>
    <initial>
      <transition target="sh1">
        <raise event="event2"/>
      </transition>
    </initial>
    <onentry>
      <send delay={ () => '1s' } event="timeout"/>
      <raise event="event1"/>
    </onentry>
    <onexit>
      <assign location="Var1" expr={ ({ Var1 }) => Var1 + 1 }/>
    </onexit>
    <history id="sh1">
      <transition target="s01">
        <raise event="event3"/>
      </transition>
    </history>

    <state id="s01">
      <transition event="event1" target="s02"/>
      <transition event="*" target="fail"/>
    </state>

    <state id="s02">
      <transition event="event2" target="s03"/>
      <transition event="*" target="fail"/>
    </state>
    <state id="s03">
      <transition cond={ ({ Var1 }) => Var1 == 0 } event="event3" target="s0"/>
      <transition cond={ ({ Var1 }) => Var1 == 1 } event="event1" target="s2"/>
      <transition event="*" target="fail"/>
    </state>
  </state>

  <state id="s2">
    <transition event="event2" target="s3"/>
    <transition event="*" target="fail"/>

  </state>

  <state id="s3">
    <transition event="event3" target="fail"/>
    <transition event="timeout" target="pass"/>
  </state>

  <final id="pass"></final>
  <final id="fail"></final>
</scxml>
