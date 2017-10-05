<scxml initial="s0" version="1.0">

  <state id="s0" initial="s01">
    <onentry>
      <send event="timeout" delay="1s"/>
      <if cond={ (_, { In }) => In('s01') }>
        <raise event="event1"/>
      </if>
    </onentry>

    <transition event="timeout" target="fail"/>
    <transition event="event1" target="fail"/>
    <transition event="event2" target="pass"/>

    <state id="s01">
      <onentry>
        <if cond={ (_, { In }) => In('s01') }>
          <raise event="event2"/>
        </if>
      </onentry>
    </state>

  </state>

  <final id="pass"></final>
  <final id="fail"></final>

</scxml>
